const axios = require("axios");
let cheerio = require("cheerio");
const url = "https://www.tozlu.com/TR/erkek-mont-kaban";
const baseURL = "https://www.tozlu.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
  const prodID = prodURL.split("-").at("-1");
  const { data } = await axios.get(
    `https://www.tozlu.com/api/product/GetProductList?c=trtry0000&FilterJson=%7B%22CategoryIdList%22%3A%5B%5D%2C%22BrandIdList%22%3A%5B%5D%2C%22SupplierIdList%22%3A%5B%5D%2C%22TagIdList%22%3A%5B%5D%2C%22TagId%22%3A-1%2C%22FilterObject%22%3A%5B%5D%2C%22MinStockAmount%22%3A-1%2C%22IsShowcaseProduct%22%3A-1%2C%22IsOpportunityProduct%22%3A-1%2C%22FastShipping%22%3A-1%2C%22IsNewProduct%22%3A-1%2C%22IsDiscountedProduct%22%3A-1%2C%22IsShippingFree%22%3A-1%2C%22IsProductCombine%22%3A-1%2C%22MinPrice%22%3A0%2C%22MaxPrice%22%3A0%2C%22Point%22%3A0%2C%22SearchKeyword%22%3A%22%22%2C%22StrProductIds%22%3A%22${prodID}%22%2C%22IsSimilarProduct%22%3Afalse%2C%22RelatedProductId%22%3A0%2C%22ProductKeyword%22%3A%22%22%2C%22PageContentId%22%3A0%2C%22StrProductIDNotEqual%22%3A%22%22%2C%22IsVariantList%22%3A-1%2C%22IsVideoProduct%22%3A-1%2C%22ShowBlokVideo%22%3A-1%2C%22VideoSetting%22%3A%7B%22ShowProductVideo%22%3A0%2C%22AutoPlayVideo%22%3A-1%7D%2C%22ShowList%22%3A1%2C%22VisibleImageCount%22%3A6%2C%22ShowCounterProduct%22%3A-1%2C%22ImageSliderActive%22%3Afalse%2C%22ProductListPageId%22%3A0%2C%22ShowGiftHintActive%22%3Afalse%7D&PagingJson=%7B%22PageItemCount%22%3A4%2C%22PageNumber%22%3A1%2C%22OrderBy%22%3A%22uk.ID%22%2C%22OrderDirection%22%3A%22DESC%22%7D`
  );
  try {
    const response = await axios.get(prodURL);
    const productsDetails = [];
    const html = response.data;
    const $ = cheerio.load(html);
    const product_source = "tozlu";
    const group_url = link;
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
    const images = [];
    let name = script.productName;
    const orjprice = script.productPriceStr + " TL";
    const price = data?.products[0]?.opportunityProduct
      ? (
          +(+script.productPriceStr.replace(",", ".") * 0.8).toFixed(2) + " TL"
        ).replace(".", ",")
      : script.productPriceStr + " TL";
    const imageUrl = script.productImages[0].bigImagePath;
    const description = $(".detay_aciklama").text();
    $(".SmallImages .AltImgCapSmallImg").map((index, element) => {
      images.push(
        $(element).find("img").data("original").replace("/thumb", "/buyuk")
      );
    });
    if (name.includes(script.productId)) {
      name = name.replace(script.productId, "");
    }
    productsDetails.push({
      name,
      orjprice,
      price,
      description,
      imageUrl,
      prodURL,
      sizes: sizes.filter((n) => n),
      colors: colors.filter((n) => n),
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
