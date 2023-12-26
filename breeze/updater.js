const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.breeze.com.tr/kiz-cocuk-giyim";
const baseURL = "https://www.breeze.com.tr";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(link, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBR4KCMAAAwAftARApHgMi0gnSb4RqKCI15vU7U7eujYQ8e%2fEPRcRJdWIuMup36uZ7NcCEQ42upweFmFNeVBCYpGAUtl3KX3jt3VASoicjkmF1lRq6R68KKVs6YAXbIQZGxAiyDFumaIh0kRN53q%2be1FjtDZmsTCkzG3SafKGTzv3w8%2fiDeAepSusw2hhly%2frtfhnQk3FsdM%2fnRcrafjHzIHTOji5kbbSPe8%2fNoF8tb%2brvpGlvA8W8u9sT0RbILy18%2f4GJE%2bVvhVvIB0Df5cwrRQP4ujGN1fVhrQgSiIwkPM1tKTq44ff8IVvg0C733PRFVVRg2NmzX5%2feGvfgYvdkBuapwS6rfYWgrx8LyqDFG6ita1k92ZQsm2qlJ%2b769Mn8%2fgHFZVoYYAEAAA%3d%3d",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Breeze";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Breeze";
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
        .trim() === '' ?
        cheerio("#fiyat2 > span.spanFiyat", html)
          .first()
          .text()
          .trim() : cheerio("#fiyat > span.spanFiyat", html)
            .first()
            .text()
            .trim()
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
    if (orjprice === '') {
      orjprice = price
    }
    if (price == "") {
      price = (Number(orjprice.split(" ")[0].replace(",", ".")) * .8).toFixed(2) + " TL";
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
    const colors = [$("#divTabOzellikler > div > div > div.teknikDetayItem.renk > div.t2 > span").text()];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Yaş" && v.stokAdedi > 0) {
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
    console.log("Requesting : " + link);
    const productUrl = link;
    urls.push(productUrl);

    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
