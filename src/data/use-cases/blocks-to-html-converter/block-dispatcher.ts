import { Block } from '../../protocols/blocks';
import { ToHtml, ToHtmlClass } from '../../../domain/use-cases/to-html';
import * as blockParsers from './block-parsers';

export class BlockDispatcher {
  dispatch(block: Block): ToHtml {
    const ToHtmlConverter = fromBlockToHtmlConverter[block.type] || blockParsers.UnknownBlockToHtml;
    return new ToHtmlConverter(block);
  }
}

const fromBlockToHtmlConverter: Record<string, ToHtmlClass> = {
  paragraph: blockParsers.TextBlockToHtml,
  heading_1: blockParsers.HeaderBlockToHtml,
  heading_2: blockParsers.HeaderBlockToHtml,
  heading_3: blockParsers.HeaderBlockToHtml,
  sub_header: blockParsers.SubHeaderBlockParser,
  sub_sub_header: blockParsers.SubSubHeaderBlockParser,
  to_do: blockParsers.ToDoBlockToHtml,
  code: blockParsers.CodeBlockToHtml,
  equation: blockParsers.EquationBlockToHtml,
  quote: blockParsers.QuoteBlockToHtml,
  divider: blockParsers.DividerBlockToHtml,
  bulleted_list_item: blockParsers.ListBlockToHtml,
  list: blockParsers.ListBlockToHtml,
  video: blockParsers.YouTubeVideoBlockToHtml,
  image: blockParsers.ImageBlockToHtml,
  callout: blockParsers.CalloutBlockToHtml,
  toggle: blockParsers.ToggleBlockToHtml,
  page: blockParsers.PageBlockToHtml,
};
