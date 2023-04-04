import { blockToInnerHtml } from '../../../../helpers/block-to-inner-html';
import { Block, DecorableText } from '../../../../protocols/blocks';
import { ToHtml } from '../../../../../domain/use-cases/to-html';
import { indentBlocksToHtml } from '../../../../helpers/blocks-to-html';

export class ListItemToHtml implements ToHtml {
  private _block: DecorableText;

  constructor(block: DecorableText) {
    this._block = block;
  }

  async convert(): Promise<string> {
    return Promise.resolve(`<li>${await blockToInnerHtml(this._block)}</li>`);
  }
}
