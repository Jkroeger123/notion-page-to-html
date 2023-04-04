import { Block } from '../../../protocols/blocks';
import { ToHtml } from '../../../../domain/use-cases/to-html';
import { Base64Converter } from '../../../../utils/base-64-converter';
import { FormatToStyle } from '../../format-to-style';

export class ImageBlockToHtml implements ToHtml {
  private readonly _block: Block;

  constructor(block: Block) {
    this._block = block;
  }

  async convert(): Promise<string> {
    if (!this._rawSrc) return '';

    const imageSource = this._rawSrc;
    const caption = this._caption;
    //const style = new FormatToStyle(this._block.format).toStyle();

    return `
<figure class="image">
<img src="${imageSource}" alt="${caption}">
${caption !== '' ? `<figcaption>${caption}</figcaption>` : ''}
</figure>
    `;
  }

  private get _rawSrc() {
    const url = this._block.image[this._block.image.type].url;
    if (!url) return;

    return url;
  }

  private get _caption() {
    const caption = this._block.image.caption;

    if (caption.length == 0) return '';

    return caption[0].plain_text;
  }
}
