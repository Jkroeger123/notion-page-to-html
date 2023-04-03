import { HtmlOptions } from '../../../data/protocols/html-options/html-options';
import { makeBlocksToHtml } from '../../factories';
import { NotionPage } from '../../protocols/notion-page';
import { Client } from '@notionhq/client';
import { getAllBlocksInPage } from './NotionPageReader';

/**
 * @class NotionPageToHtml
 * @description This class converts a Notion page to HTML using the convert method.
 */
export class NotionPageToHtml {
  /**
   * @description It converts a Notion page to HTML. Page must be public before it can be converted.
   * It can be made private again after the conversion.
   * @param pageURL The URL of the page to convert. Can be notion.so or notion.site URL.
   * @param htmlOptions Options to customize the HTML output. It is an object with the following properties:
   * @param htmlOptions.excludeCSS If true, it will return html without style tag. It is false by default.
   * @param htmlOptions.excludeMetadata If true, it will return html without metatags. It is false by default.
   * @param htmlOptions.excludeScripts If true, it will return html without scripts. It is false by default.
   * @param htmlOptions.excludeHeaderFromBody If true, it will return  html without title, cover and icon inside body. It is false by default.
   * @param htmlOptions.excludeTitleFromHead If true, it will return html without title tag in head. It is false by default.
   * @param htmlOptions.bodyContentOnly If true, it will return html body tag content only. It is false by default.
   *
   * @returns The converted Page. It is an object with the following properties:
   * - title: The title of the page.
   * - icon: The icon of the page. Can be an emoji or a base64 encoded image string.
   * - cover: The cover image of the page. It is a base64 encoded image string.
   * - html: The raw HTML string of the page.
   * @throws If the page is not public, it will throw an error.
   * @throws If the page is not found, it will throw an error.
   * @throws If the url is invalid, it will throw an error.
   */
  static async convert(pageId: string, access_token: string, htmlOptions: HtmlOptions = {}): Promise<NotionPage> {
    const notion = new Client({
      auth: access_token,
    });

    const blocks = await getAllBlocksInPage(notion, pageId);

    if (blocks.length === 0) return Promise.resolve({ html: '' });

    const htmlBody = await makeBlocksToHtml(blocks).convert();

    return {
      html: htmlBody,
    };
  }
}
