const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.sefamerve.com/k/tesettur-giyim/elbise";
const baseURL = "https://www.sefamerve.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "geo=TR; goip=TR; currency=TRY;",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Sefamerve";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    let sizes = [];
    let colors = [];
    const brand = "Sefamerve";
    const name = cheerio("div.detail_container > h1", html).text().trim();
    let orjprice = $("#product-data > div.price_block_div > div.product_price_cont > div.price_market").text().trim();
    let price = $("#product-data > div.price_block_div > div.product_price_cont > div.price_our").text().trim();
    if (orjprice == "") {
      orjprice = price;
    }
    const description = $("#tab_content_attr > div.detail_scroll_cont > :not(:nth-child(-n + 3))").text().trim();
    $("div.image_container div.zoom_gallery a.gallery_thumb").map((i, e) => images.push($(e).attr("href")))
    imageUrl = images[0];
    $("#select_an_option .option_div.option_selectable").map((i, e) => sizes.push($(e).text().trim()))

    $("div.pd_similar div.pd_similar_cont").map((i, e) => colors.push($(e).text().trim()))
    if (sizes.filter((n) => n).length < 1) {
      sizes.push("STD")
    }
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes,
      propiteam,
      colors,
      group_url,
      product_source,
      images,
    });

    return productsDetails;
  } catch (error) {
    console.log(error);
    productsDetails = [];
    return productsDetails;
  }
}

async function getProductsData(link, urls = []) {
  let page_num = 1;
  let dataTable;
  const response = await axios.get(link, {
    validateStatus: () => true
  });

  const outerhtml = response.data;
  const DT = cheerio.load(outerhtml);
  console.log(DT("head > link:nth-child(14)").attr('href'))
  const linkDestruct = DT("head > link:nth-child(14)").attr('href').includes("filter_tree_ids=") ? DT("head > link:nth-child(14)").attr('href').split("filter_tree_ids=")[1].split("&")[0] : DT("head > link:nth-child(14)").attr('href').split("keyword=")[1]
  console.log(linkDestruct)
  console.log(link)
  try {
    do {
      const response = await fetch(`https://www.sefamerve.com/product/products/0?cky=0bdcf8851a372ef39e1cd46bf175de62&filter_category_ids=0&with_url=true&1&page_num=${page_num}&sp=860409,718653,718650,420935&${DT("head > link:nth-child(14)").attr('href').includes("filter_tree_ids=") ? "filter_tree_ids" : "keyword"}=${linkDestruct}`, {
        "headers": {
          "accept": "text/html, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9,ar;q=0.8,en-TR;q=0.7,tr-TR;q=0.6,tr;q=0.5",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": `${link}`,
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": `1&filter_category_ids=0&page_num=${page_num}&sp=860409,718653,718650,420935&${DT("head > link:nth-child(14)").attr('href').includes("filter_tree_ids=") ? "filter_tree_ids" : "keyword"}=${linkDestruct}`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      });
      const resp = await response.text()
      const outerhtml = resp;

      dataTable = cheerio(
        "div.product_thumb.ps_normal",
        outerhtml
      );
      console.log(dataTable.length)
      dataTable.each(function () {
        const productUrl = cheerio(this).find("a").attr("href");
        urls.push(productUrl);
      });
      page_num++;
      console.log(urls.length)
      // return await getProduct(urls[0], link);
      if (dataTable.length === 0) {
        return Promise.all(urls.map((url) => getProduct(url, link)));
      }
    } while (dataTable.length !== 0);
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};


