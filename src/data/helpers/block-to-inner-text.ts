import { Block, DecorableText } from '../../data/protocols/blocks';

export const blockToInnerText = (block: Block): string => {
  const decorableTexts = block.decorableTexts;
  return decorableTexts ? decorableTexts.map((dt: DecorableText) => dt.text.content).join('') : '';
};
