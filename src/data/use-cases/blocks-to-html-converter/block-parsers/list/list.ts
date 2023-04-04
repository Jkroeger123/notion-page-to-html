import { Block, DecorableText } from '../../../../protocols/blocks';
import { ToHtml } from '../../../../../domain/use-cases/to-html';
import { ListItemToHtml } from './list-item';
import { FormatToStyle } from '../../../format-to-style';
import { indentBlocksToHtml } from 'data/helpers/blocks-to-html';
import { Decorator } from '../decorations/decorator';
import { replaceLineBreakByBrTag } from 'data/helpers/replace-line-break-to-br-tag';

export class ListBlockToHtml implements ToHtml {
  private readonly _block: Block;

  constructor(block: Block) {
    this._block = block;
  }

  async convert(): Promise<string> {
    const tag: string = fromTypeToTag[this._block.children[0].type] || fromTypeToTag.bulleted_list_item;
    //const style = new FormatToStyle(this._block.format).toStyle();

    //const childrenHtml = await indentBlocksToHtml(this._block.children);
    const innerHtml = await this._itemsHtml();

    return Promise.resolve(`<${tag}>\n${innerHtml}\n</${tag}>`);
  }

  private async _itemsHtml(): Promise<string> {
    const items = await Promise.all(this._block.children.map(async (c: Block) => new ListItemToHtml(c).convert()));
    return Promise.resolve(items.join('\n'));
  }
}

const fromTypeToTag: Record<string, string> = {
  bulleted_list_item: 'ul',
  numbered_list_item: 'ol',
};
