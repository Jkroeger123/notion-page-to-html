import { blockToInnerHtml } from '../../../helpers/block-to-inner-html';
import { Block } from '../../../protocols/blocks';
import { ToHtml } from '../../../../domain/use-cases/to-html';
import { indentBlocksToHtml } from '../../../helpers/blocks-to-html';

export class TextBlockToHtml implements ToHtml {
  private readonly _block: Block;

  constructor(block: Block) {
    this._block = block;
  }

  async convert(): Promise<string> {
    const childrenHtml = await indentBlocksToHtml(this._block.paragraph.children);

    return Promise.resolve(`<p>${await blockToInnerHtml(this._block)}${childrenHtml}</p>`);
  }
}
