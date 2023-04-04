type BlockType =
  | 'bookmark'
  | 'breadcrumb'
  | 'bulleted_list_item'
  | 'callout'
  | 'child_database'
  | 'child_page'
  | 'column'
  | 'column_list'
  | 'divider'
  | 'embed'
  | 'equation'
  | 'file'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'image'
  | 'link_preview'
  | 'link_to_page'
  | 'numbered_list_item'
  | 'paragraph'
  | 'pdf'
  | 'quote'
  | 'synced_block'
  | 'table'
  | 'table_of_contents'
  | 'table_row'
  | 'template'
  | 'to_do'
  | 'toggle'
  | 'unsupported'
  | 'video';

interface BlockBase {
  object: 'block';
  id: string;
  type: BlockType;
  has_children: boolean;
}

export type Block = BlockBase & BlockProperties;

type BlockProperties = {
  [K in BlockType]: any;
}[BlockType];
