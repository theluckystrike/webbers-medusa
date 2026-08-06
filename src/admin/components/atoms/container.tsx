import { Container as UiContainer, clx } from '@medusajs/ui';
import { ComponentProps } from 'react';

type ContainerProps = ComponentProps<typeof UiContainer>;

export const Container = (props: ContainerProps) => {
  return <UiContainer {...props} className={clx('divide-y p-0', props.className)} />;
};
