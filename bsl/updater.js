const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.bsl.com.tr/tr/koleksiyon/editorun-sectikleri/";
const baseURL = "https://www.bsl.com.tr";
if (typeof (cheerio) != 'function') cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
    try {
        const response = await axios.get(prodURL);
        var productsDetails = [];
        const html = response.data;
        const $ = cheerio.load(html);
        const product_source = "BSL";
        const group_url = link;
        const propiteam = '';
        const final_sizes = [];
        const final_colors = [];
        const final_images = [];
        let images = [];
        let imageUrl = '';
        const brand = "BSL";
        const name = cheerio(".ProductHeader", html).text().trim();
        const orjprice = cheerio("div.col-22.col-md-22.col-lg-22.col-xl-22 > div > div.PriceContainer > span", html).first().text().replace(/\s+/g, ' ').trim()
        let price = cheerio("div.col-22.col-md-22.col-lg-22.col-xl-22 > div > div.PriceContainer > div > strong", html).first().text().replace(/\s+/g, ' ').trim()
        if (price == "") {
            price = orjprice
        }
        const description = cheerio("#aciklama > div", html).text().trim();

        const size = cheerio(".SizeOptions", html).html();

        $(size).each(function (i, elm) {
            if ($(elm).attr('class') != 'outer') {
                final_sizes.push($('a', elm).text());
            }
        });
        const sizes = final_sizes.filter(function (el) {
            return el != "";
        });
        const color = cheerio(".ItemColorsContainer", html).html();

        $(color).each(function (i, elm) {
            final_colors.push($('a', elm).attr('title'));
        });
        const colors = final_colors.filter(function (el) {
            if ((el != null) || (el != "")) {
                return el;
            }

        });
        const image = cheerio(".ProductDetailImages .ProductDetailsMainImage ul", html).html();
        $(image).each(function (i, elm) {
            final_images.push($('li img', elm).attr('src'));
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
