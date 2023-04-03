// @ts-nocheck

import { type Client } from "@notionhq/client";


type RichText = {
  plain_text: string;
};

type Text = {
  rich_text: any;
  text: RichText[];
};

type Paragraph = Text;
type Heading1 = Text;
type Heading2 = Text;
type Heading3 = Text;
type BulletedListItem = Text;
type NumberedListItem = Text;

type Block =
  | {
      id: string;
      object: "block";
      type: "paragraph";
      paragraph: Paragraph;
      has_children: boolean;
    }
  | {
      id: string;
      object: "block";
      type: "heading_1";
      heading_1: Heading1;
      has_children: boolean;
    }
  | {
      id: string;
      object: "block";
      type: "heading_2";
      heading_2: Heading2;
      has_children: boolean;
    }
  | {
      id: string;
      object: "block";
      type: "heading_3";
      heading_3: Heading3;
      has_children: boolean;
    }
  | {
      id: string;
      object: "block";
      type: "bulleted_list_item";
      bulleted_list_item: BulletedListItem;
      has_children: boolean;
    }
  | {
      id: string;
      object: "block";
      type: "numbered_list_item";
      numbered_list_item: NumberedListItem;
      has_children: boolean;
    };

type Page = {
  id: string;
  object: "page";
};

async function getAllDatabases(notion: Client): Promise<string[]> {
  let databaseList = [];
  let hasNextPage = true;
  let startCursor: string | undefined = undefined;

  while (hasNextPage) {
    const response = await notion.search({
      filter: { property: "object", value: "database" },
      start_cursor: startCursor,
    });
    const databaseIds = response.results.map((db) => db.id);
    databaseList = [...databaseList, ...databaseIds];

    for (const dbId of databaseIds) {
      const inlineDatabaseIds = await getAllInlineDatabases(notion, dbId);
      databaseList = [...databaseList, ...inlineDatabaseIds];
    }

    hasNextPage = response.has_more;
    startCursor = response.next_cursor;
  }

  return databaseList;
}

async function getAllInlineDatabases(
  notion: Client,
  blockId: string
): Promise<string[]> {
  let inlineDatabaseList = [];
  const childBlocks = await notion.blocks.children.list({ block_id: blockId });
  for (const block of childBlocks.results) {
    if (block.type === "child_database") {
      inlineDatabaseList.push(block.id);
    }
    if (block.has_children) {
      const childInlineDatabases = await getAllInlineDatabases(
        notion,
        block.id
      );
      inlineDatabaseList = [...inlineDatabaseList, ...childInlineDatabases];
    }
  }
  return inlineDatabaseList;
}

async function getAllPagesInDatabase(
  notion: Client,
  databaseId: string
): Promise<string[]> {
  let pageList = [];
  let hasNextPage = true;
  let startCursor: string | undefined = undefined;

  while (hasNextPage) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
    });
    const pageIds = response.results.map((page) => page.id);
    pageList = [...pageList, ...pageIds];

    hasNextPage = response.has_more;
    startCursor = response.next_cursor;
  }

  return pageList;
}

function isTextBlock(
  block: Block
): block is Block & { [type in Block["type"]]: Text } {
  const textBlockTypes: Block["type"][] = [
    "paragraph",
    "heading_1",
    "heading_2",
    "heading_3",
    "bulleted_list_item",
    "numbered_list_item",
  ];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return textBlockTypes.includes(block.type) && block[block.type]?.rich_text;
}

function getBlockText(block: Block): string {
  if (isTextBlock(block)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const textContent = block[block.type].rich_text as RichText[];
    console.log(textContent.map((t) => t));
    return textContent.map((t: RichText) => t.plain_text).join("");
  }
  return "";
}

async function getAllBlockText(
  notion: Client,
  blockId: string
): Promise<string> {
  const block = (await notion.blocks.retrieve({ block_id: blockId })) as Block;
  const currentBlockText = getBlockText(block);

  if (block.has_children) {
    const childBlocks = await notion.blocks.children.list({
      block_id: blockId,
    });
    const childrenTextPromises = childBlocks.results.map((childBlock) =>
      getAllBlockText(notion, childBlock.id)
    );
    const childrenText = await Promise.all(childrenTextPromises);

    return [currentBlockText, ...childrenText].join(" ");
  }

  return currentBlockText;
}

async function getAllStandalonePages(notion: Client): Promise<string[]> {
  let pageList = [];
  let hasNextPage = true;
  let startCursor: string | undefined = undefined;

  while (hasNextPage) {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      start_cursor: startCursor,
    });
    const pageIds = response.results.map((page) => page.id);
    pageList = [...pageList, ...pageIds];

    hasNextPage = response.has_more;
    startCursor = response.next_cursor;
  }

  return pageList;
}

async function getTextFromPage(
  notion: Client,
  pageId: string
): Promise<string> {
  const blockChildrenResponse = await notion.blocks.children.list({
    block_id: pageId,
  });
  const blockChildren = blockChildrenResponse.results as Block[];

  const pageTextPromises = blockChildren.map(async (block) => {
    const blockText = getBlockText(block);

    if (block.type === "child_page") {
      const subPageText = await getTextFromPage(notion, block.id);
      return `${blockText} ${subPageText}`;
    }

    if (block.has_children) {
      const childText = await getAllBlockText(notion, block.id);
      return `${blockText} ${childText}`;
    }
    return blockText;
  });

  const pageText = await Promise.all(pageTextPromises);

  return pageText.join(" ");
}



async function getAllBlocks(notion: Client, blockId: string): Promise<Block[]> {
    const block = (await notion.blocks.retrieve({ block_id: blockId })) as Block;
    const blocks = [block];
  
    if (block.has_children) {
      const childBlocks = await notion.blocks.children.list({
        block_id: blockId,
      });
      const childrenBlockPromises = childBlocks.results.map((childBlock) =>
        getAllBlocks(notion, childBlock.id)
      );
      const childrenBlocks = await Promise.all(childrenBlockPromises);
  
      for (const childBlocks of childrenBlocks) {
        blocks.push(...childBlocks);
      }
    }
  
    return blocks;
  }
  
  export async function getAllBlocksInPage(notion: Client, pageId: string): Promise<Block[]> {
    const blockChildrenResponse = await notion.blocks.children.list({
      block_id: pageId,
    });
    const blockChildren = blockChildrenResponse.results as Block[];
  
    const blockPromises = blockChildren.map(async (block) => {
      if (block.type === "child_page") {
        const subPageBlocks = await getAllBlocksInPage(notion, block.id);
        return [block, ...subPageBlocks];
      } else if (block.has_children) {
        const childBlocks = await getAllBlocks(notion, block.id);
        return [block, ...childBlocks];
      } else {
        return [block];
      }
    });
  
    const blocksNested = await Promise.all(blockPromises);
    const blocks = ([] as Block[]).concat(...blocksNested);
  
    return blocks;
  }