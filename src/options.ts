// Host-provided plugin options. Kept fully generic so the plugin has no knowledge of any specific
// domain module (e.g. subscriptions). A host that owns extra customer-scoped tables declares them
// here (via medusa-config.ts plugin options) and the customer anonymize / edit-email routines
// include them inside the same transaction.
//
//   plugins: [
//     {
//       resolve: '@webbers/webbers-medusa',
//       options: {
//         anonymize: {
//           emailDomain: 'example.com',
//           customerScopedTables: [{ table: 'subscription', emailColumns: ['email'], nullColumns: ['payment_config'] }],
//           addressTables: [{ addressTable: 'subscription_address', parentTable: 'subscription' }],
//         },
//         editEmail: {
//           emailSyncTables: [{ table: 'subscription' }],
//         },
//       },
//     },
//   ]

/** A table with a `customer_id`-style column, scrubbed directly during anonymize. */
export type AnonymizeCustomerScopedTable = {
  table: string;
  /** Column that scopes rows to the customer. Default `customer_id`. */
  customerIdColumn?: string;
  /** Columns set to the generated anonymized email. */
  emailColumns?: string[];
  /** Columns set to NULL. */
  nullColumns?: string[];
};

/** An address table reached via a parent table's billing/shipping FK, scrubbed to NULL. */
export type AnonymizeAddressTable = {
  addressTable: string;
  parentTable: string;
  /** Column on the parent table that scopes rows to the customer. Default `customer_id`. */
  customerIdColumn?: string;
  /** FK column on the parent pointing at the billing address. Default `billing_address_id`. */
  billingColumn?: string;
  /** FK column on the parent pointing at the shipping address. Default `shipping_address_id`. */
  shippingColumn?: string;
  /** Columns to NULL out. Default `DEFAULT_ADDRESS_NULL_COLUMNS`. */
  nullColumns?: string[];
};

/** A table whose email column should follow the customer email on edit-email. */
export type EmailSyncTable = {
  table: string;
  /** Column holding the email. Default `email`. */
  emailColumn?: string;
  /** Column that scopes rows to the customer. Default `customer_id`. */
  customerIdColumn?: string;
};

export type WebbersMedusaOptions = {
  anonymize?: {
    /** Domain used for the generated anonymized email (`anon+<ts>@<domain>`). Default `anonymized.invalid`. */
    emailDomain?: string;
    customerScopedTables?: AnonymizeCustomerScopedTable[];
    addressTables?: AnonymizeAddressTable[];
  };
  editEmail?: {
    emailSyncTables?: EmailSyncTable[];
  };
};

export const DEFAULT_ADDRESS_NULL_COLUMNS = [
  'first_name',
  'last_name',
  'company',
  'phone',
  'address_1',
  'address_2',
  'city',
  'country_code',
  'postal_code',
  'metadata',
];

const DEFAULT_ANON_EMAIL_DOMAIN = 'anonymized.invalid';

type Statement = { sql: string; params: unknown[] };

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// Table/column names cannot be parameterized, so they are interpolated. They come from trusted
// developer config (medusa-config.ts), but we still validate to be safe against typos/injection.
function ident(name: string): string {
  if (!IDENTIFIER.test(name)) {
    throw new Error(`[@webbers/webbers-medusa] invalid SQL identifier in plugin options: "${name}"`);
  }
  return name;
}

/** Build the anonymized email address for a customer. */
export function buildAnonEmail(domain: string | undefined, uniqueSuffix: string | number): string {
  return `anon+${uniqueSuffix}@${domain ?? DEFAULT_ANON_EMAIL_DOMAIN}`;
}

/** `UPDATE <table> SET <emailCols>=?, <nullCols>=NULL WHERE <customerIdColumn> = ?` per configured table. */
export function buildCustomerScopedAnonymizeStatements(
  tables: AnonymizeCustomerScopedTable[] | undefined,
  customerId: string,
  anonEmail: string
): Statement[] {
  const statements: Statement[] = [];

  for (const t of tables ?? []) {
    const table = ident(t.table);
    const customerIdColumn = ident(t.customerIdColumn ?? 'customer_id');
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const col of t.emailColumns ?? []) {
      sets.push(`${ident(col)} = ?`);
      params.push(anonEmail);
    }
    for (const col of t.nullColumns ?? []) {
      sets.push(`${ident(col)} = NULL`);
    }

    if (!sets.length) continue;

    params.push(customerId);
    statements.push({
      sql: `UPDATE "${table}" SET ${sets.join(', ')} WHERE ${customerIdColumn} = ?`,
      params,
    });
  }

  return statements;
}

/** NULL out address rows referenced by a parent table's billing/shipping FKs for a customer. */
export function buildAddressAnonymizeStatements(
  tables: AnonymizeAddressTable[] | undefined,
  customerId: string
): Statement[] {
  const statements: Statement[] = [];

  for (const t of tables ?? []) {
    const addressTable = ident(t.addressTable);
    const parentTable = ident(t.parentTable);
    const customerIdColumn = ident(t.customerIdColumn ?? 'customer_id');
    const billingColumn = ident(t.billingColumn ?? 'billing_address_id');
    const shippingColumn = ident(t.shippingColumn ?? 'shipping_address_id');
    const nullColumns = (t.nullColumns ?? DEFAULT_ADDRESS_NULL_COLUMNS).map(ident);

    const sets = nullColumns.map((c) => `${c} = NULL`).join(', ');

    statements.push({
      sql: `UPDATE "${addressTable}"
       SET ${sets}
       WHERE id IN (
           SELECT ${billingColumn} FROM "${parentTable}" WHERE ${customerIdColumn} = ? AND ${billingColumn} IS NOT NULL
           UNION
           SELECT ${shippingColumn} FROM "${parentTable}" WHERE ${customerIdColumn} = ? AND ${shippingColumn} IS NOT NULL
       )`,
      params: [customerId, customerId],
    });
  }

  return statements;
}

/** `UPDATE <table> SET <emailColumn> = ? WHERE <customerIdColumn> = ?` per configured table. */
export function buildEmailSyncStatements(
  tables: EmailSyncTable[] | undefined,
  customerId: string,
  newEmail: string
): Statement[] {
  const statements: Statement[] = [];

  for (const t of tables ?? []) {
    const table = ident(t.table);
    const emailColumn = ident(t.emailColumn ?? 'email');
    const customerIdColumn = ident(t.customerIdColumn ?? 'customer_id');

    statements.push({
      sql: `UPDATE "${table}" SET ${emailColumn} = ? WHERE ${customerIdColumn} = ?`,
      params: [newEmail, customerId],
    });
  }

  return statements;
}
