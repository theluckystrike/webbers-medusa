import { DAL } from '@medusajs/types';
import { MedusaService, InjectManager, InjectTransactionManager, MedusaContext } from '@medusajs/framework/utils';
import { Context } from '@medusajs/framework/types';
import { EntityManager } from '@medusajs/framework/mikro-orm/knex';
import CustomQuery from './models/custom-query';

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService;
};

export default class CustomQueryService extends MedusaService({ CustomQuery }) {
  protected baseRepository_: DAL.RepositoryService;

  constructor({ baseRepository }: InjectedDependencies) {
    super(...arguments);
    this.baseRepository_ = baseRepository;
  }

  /**
   * Execute a PostgreSQL query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   *
   * @example
   * ```ts
   * const result = await customQueryService.PSQLQuery(
   *   'SELECT * FROM product WHERE id = ?',
   *   [productId]
   * );
   * ```
   */
  @InjectManager()
  async PSQLQuery<T = any>(
    query: string,
    params: any[] = [],
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<any> {
    const manager = sharedContext?.manager;
    return await manager?.execute(query, params);
  }

  /**
   * Execute a PostgreSQL transaction
   * @param callback - Transaction callback function that receives the transaction manager
   * @returns Transaction result
   *
   * @example
   * ```ts
   * const result = await customQueryService.PSQLTransaction(async (transactionManager) => {
   *   await transactionManager.execute(
   *     'UPDATE product SET title = ? WHERE id = ?',
   *     [newTitle, productId]
   *   );
   *
   *   await transactionManager.execute(
   *     'INSERT INTO product_history (product_id, action) VALUES (?, ?)',
   *     [productId, 'updated']
   *   );
   *
   *   return { success: true };
   * });
   * ```
   */
  @InjectTransactionManager()
  async PSQLTransaction<T = any>(
    callback: (transactionManager: EntityManager) => Promise<T>,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<any> {
    if (!sharedContext?.transactionManager) {
      throw new Error('Transaction manager not available');
    }

    return await this.baseRepository_.transaction(async transactionManager => callback(transactionManager), {
      transaction: sharedContext.transactionManager,
    });
  }
}
