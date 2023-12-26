const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.tubabutik.com/indirim";
const baseURL = "https://www.tubabutik.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAA3Oy6JCQAAA0A%2byiGqoRYuMV6ExGK9daDyTIcLX33u%2b4Mhp8Vj5391IGtmAaFDo5JgCNWbyXMeMYtW1Z5esJF6QftpAaxYI2nvDmiM%2fOOqNrcR1n7KU07YeRz8urU23XCsisU0Q7qre7fXzqfwkZFtWZkzKGE5hSHutDNdiwDhRdpjaC%2bLiboKmSHMxiA4MqlV3lREGQrJvdp%2fwnQLmklgW5eODS9VsRAzQZ9UD%2bPg2tdxaknTgGWonmIoKuYEiVKaso%2fRVB0qpveT%2b7Tj6jrSS79kWgE%2fVcXnwP8%2b6JGAQ236JUxJN9rWDuT2rvV6Aq5WvS4vdyqtVNORntXwXLoeE%2bzoYP6iZ3hzFCPAFA10lB%2bUIha8GQ9G9eX6eD8Xl8gfGrO1AWAEAAA%3d%3d"
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Tubabutik";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Tubabutik";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice =
      cheerio("#fiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
    if (orjprice === "") {
      orjprice = cheerio("#fiyat2 > span.spanFiyat", html)
        .first()
        .text()
        .trim()
    }
    if (price === '') {
      price = orjprice
    }
    let script;
    for (let i = 0; i < $("script").length; i++) {
      const element = $("script")[i];
      if (element.children[0]?.data?.includes("var productDetailModel = ")) {
        script = JSON.parse(
          element?.children[0]?.data
            .split("var productDetailModel = ")[1]
            .split(";//]]")[0]
            .split(";")[0]
        );
      }
    }
    const colors = [script.productVariantData[0].tanim];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Beden" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt > ul > :not(:nth-child(1))", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
    });
    imageUrl = images[0];
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    productsDetails.push({
      name,
      brand,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
      propiteam,
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
  try {
    const response = await axios.get(link, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAA3Oy6JCQAAA0A%2byiGqoRYuMV6ExGK9daDyTIcLX33u%2b4Mhp8Vj5391IGtmAaFDo5JgCNWbyXMeMYtW1Z5esJF6QftpAaxYI2nvDmiM%2fOOqNrcR1n7KU07YeRz8urU23XCsisU0Q7qre7fXzqfwkZFtWZkzKGE5hSHutDNdiwDhRdpjaC%2bLiboKmSHMxiA4MqlV3lREGQrJvdp%2fwnQLmklgW5eODS9VsRAzQZ9UD%2bPg2tdxaknTgGWonmIoKuYEiVKaso%2fRVB0qpveT%2b7Tj6jrSS79kWgE%2fVcXnwP8%2b6JGAQ236JUxJN9rWDuT2rvV6Aq5WvS4vdyqtVNORntXwXLoeE%2bzoYP6iZ3hzFCPAFA10lB%2bUIha8GQ9G9eX6eD8Xl8gfGrO1AWAEAAA%3d%3d"
      },
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div#ProductPageProductList .ItemOrj",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.productItem div.productImage a").attr("href");
      urls.push(productUrl);
    });
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
