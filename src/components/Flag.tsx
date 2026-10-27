import { IS_IRAQ } from '../edition';
import { IraqFlag } from './IraqFlag';
import { KurdistanFlag } from './KurdistanFlag';

/** The flag for this edition: Iraq for the national edition, Kurdistan Region otherwise. */
export function Flag(props: { width?: number; className?: string }) {
  return IS_IRAQ ? <IraqFlag {...props} /> : <KurdistanFlag {...props} />;
}
