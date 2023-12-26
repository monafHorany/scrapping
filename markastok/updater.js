const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.markastok.com/firsat-urunleri";
const baseURL = "https://www.markastok.com";
if (typeof (cheerio) != 'function') cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
    try {
        const response = await axios.get(prodURL);
        var productsDetails = [];
        const html = response.data;
        const $ = cheerio.load(html);
        const product_source = "markastok";
        const group_url = link;
        const propiteam = '';
        const final_sizes = [];
        const final_colors = [];
        const final_images = [];
        let images = [];
        let imageUrl = '';
        const brand = "markastok";
        const name = cheerio("h1.fl.col-12.product-name", html).text().trim();
        const orjprice = cheerio("span.product-price", html).first().text().trim()
        let price = cheerio("span.product-price", html).first().text().trim()
        if (price == "") {
            price = orjprice
        }
        const description = cheerio("#productRight > div > div.fl.col-12.product-feature > div > div:nth-child(2)", html).text().trim();
        const size = $("div.new-size-variant.fl.col-12.ease.variantList").html();
        // console.log(size)
        $(size).each(function (i, elm) {
            final_sizes.push($(elm).find('a.col.box-border:not(.passive) p').text())
        });
        const sizes = final_sizes.filter(function (el) {
            return el != "";
        });

        const colors = [$("div.new-color-select div.variantType").first().text()]
        const image = cheerio("div.fl.col-12.carousel-wrapper div.product-main-carousel", html).html();
        $(image).each(function (i, elm) {
            final_images.push($('div a', elm).attr('href'));
        });
        images = final_images.filter(function (el) {
            if ((el != null) || (el != "")) {
                return el;
            }

        });
        imageUrl = images[0];
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
            images
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
