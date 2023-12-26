const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://sanstekstil.com/sans-tekstil-2";
const baseURL = "https://sanstekstil.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXB2aJCQAAA0A%2fyIGHoUYzlDmoQmTfLlDXrSL7%2bngMra19GJKLc25t2I4q%2fYndzikN9fM86N2C228Kbag8q19CtDX2BZuJsBqMP9EXpgliQi6O3oEWkkVzhOhK0Am1BbUyfayWA1wgzMLkRU5NFuYVAm9n5FBuyk7lz0p3WoNGVuzj6%2fRge0cjxmYQz2wXefNGfTjMffGHBocR2We9HfDWtYNf8n6kGsqjkY9Z%2b%2fxCgwOcA7j6pxKS0NQcu1l%2f93DvCiqqQEzqWwbPVE21V4pxh9tN5GPjJcIUpXm9aGEon%2b7bPnr6okkRK2zHo2%2bqexBjF%2fXnnVpC0PMnyfkAXMXOblIK7%2fyqrHRKTxbL0HmzRUSFPyWSlN7S11hpNnsMNkkmKCf8DzxAq8GABAAA%3d",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Sanstekstil";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Sanstekstil";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    let orjprice =
      cheerio("#fiyat2 > span.spanFiyat", html)
        .first()
        .text()
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = orjprice;
    }

    if (orjprice.length > 6 || price.length > 6) {
      orjprice = orjprice.replace(".", "").split(",")[0].replace("₺", "") + " TL";
      price = price.replace(".", "").split(",")[0].replace("₺", "") + " TL";
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
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").attr("src").replace("/thumb", "/buyuk")
      );
    });
    if (sizes.filter((n) => n).length === 0) {
      return productsDetails
    }
    imageUrl = images[0];
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
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXB2aJCQAAA0A%2fyIGHoUYzlDmoQmTfLlDXrSL7%2bngMra19GJKLc25t2I4q%2fYndzikN9fM86N2C228Kbag8q19CtDX2BZuJsBqMP9EXpgliQi6O3oEWkkVzhOhK0Am1BbUyfayWA1wgzMLkRU5NFuYVAm9n5FBuyk7lz0p3WoNGVuzj6%2fRge0cjxmYQz2wXefNGfTjMffGHBocR2We9HfDWtYNf8n6kGsqjkY9Z%2b%2fxCgwOcA7j6pxKS0NQcu1l%2f93DvCiqqQEzqWwbPVE21V4pxh9tN5GPjJcIUpXm9aGEon%2b7bPnr6okkRK2zHo2%2bqexBjF%2fXnnVpC0PMnyfkAXMXOblIK7%2fyqrHRKTxbL0HmzRUSFPyWSlN7S11hpNnsMNkkmKCf8DzxAq8GABAAA%3d",
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
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
