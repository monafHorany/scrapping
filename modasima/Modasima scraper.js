const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.modasima.com/yeni-gelen-giyim-modelleri";
const baseURL = "https://www.modasima.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  try {
    const response = await axios.get(prodURL, {
      headers: {
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBx4JDQAAA0A%2fKQZTFHJUMRgmrDTc1Rhdl8fX7HklT0iSft4VdQIjhMT8jSwskmly%2bfsMEHx4Msns7LmXM%2bytkNdmWXvqSdctuJbYgjYySr6jaNaTaseVIW8EG5gxgp8vny0sRVm7Q7E1coump99xEARlgCPu80NaDXzDtWYfZm%2fOQnyYU3lfTELmLuDb%2fnqZgCzMKBSBR4XjXFbFsKBl%2fMapY7rpz3XN%2bhXie6O5Q2%2bKxcZ1fes2gYySG15JJsCDKOLeuThXSPWPw9y0Imr9RYIhrgFM%2f0Qw%2fslqV7WnHoVb8YHUfxryBUM0%2fnltEpX4fVDNjquHz9QlXsQG0%2bQntZVGxtaQDcU0a1SLr7SXP3wzPxXemnDQo%2bBIPUH20wOlP6x%2bdSlf0YAEAAA%3d%3d",
      },
    });
    var productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "Modasima";
    const group_url = link;
    const propiteam = "";
    let images = [];
    let imageUrl = "";
    const brand = "Modasima";
    const name = cheerio(
      "#ProductDetailMain > div > div.RightDetail > div.ProductName > h1 > span",
      html
    )
      .first()
      .text()
      .trim();
    const orjprice =
      cheerio("span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    let price =
      cheerio("#indirimliFiyat > span.spanFiyat", html)
        .first()
        .text()
        .trim()
        .replace("₺", "") + " TL";
    if (cheerio("#indirimliFiyat > span.spanFiyat", html)
      .first()
      .text()
      .trim() === "") {
      price = orjprice;
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
    const colors = [];
    const sizes = script.productVariantData.map((v) => {
      if (v.ekSecenekTipiTanim === "Bedeni" && v.stokAdedi > 0) {
        return v.tanim;
      }
    });
    const description = cheerio("div#divTabOzellikler > div.urunTabAlt", html)
      .text()
      .trim();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").data("original").replace("/thumb", "/buyuk")
      );
    });
    if (sizes.filter((n) => n).length < 1) {
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
        Cookie: "CultureSettings=H4sIAAAAAAAEAAXBx4JDQAAA0A%2fKQZTFHJUMRgmrDTc1Rhdl8fX7HklT0iSft4VdQIjhMT8jSwskmly%2bfsMEHx4Msns7LmXM%2bytkNdmWXvqSdctuJbYgjYySr6jaNaTaseVIW8EG5gxgp8vny0sRVm7Q7E1coump99xEARlgCPu80NaDXzDtWYfZm%2fOQnyYU3lfTELmLuDb%2fnqZgCzMKBSBR4XjXFbFsKBl%2fMapY7rpz3XN%2bhXie6O5Q2%2bKxcZ1fes2gYySG15JJsCDKOLeuThXSPWPw9y0Imr9RYIhrgFM%2f0Qw%2fslqV7WnHoVb8YHUfxryBUM0%2fnltEpX4fVDNjquHz9QlXsQG0%2bQntZVGxtaQDcU0a1SLr7SXP3wzPxXemnDQo%2bBIPUH20wOlP6x%2bdSlf0YAEAAA%3d%3d",
      },
    });

    const outerhtml = response.data;

    const dataTable = cheerio(
      "div#ProductPageProductList .ItemOrj.col-lg-4.col-md-4.col-sm-6.col-xs-6",
      outerhtml
    );

    dataTable.each(function () {
      const productUrl =
        baseURL +
        cheerio(this).find("div.productItem div.productImage a").first().attr("href");
      urls.push(productUrl);
    });
    console.log(urls.length)
    // return await getProduct(urls[0], link);
    return Promise.all(urls.map((url) => getProduct(url, link)));
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  getProductsData,
};
