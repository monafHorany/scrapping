const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.haydigiy.com/alt-giyim";
const baseURL = "https://www.haydigiy.com";
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
    try {
        const response = await axios.get(prodURL);
        var productsDetails = [];
        const html = response.data;
        const $ = cheerio.load(html);
        const product_source = "Haydigiy";
        const group_url = link;
        const name = $("#content > div.pro-deatil.clearfix.row.product-content > div.col-sm-6.right_info > h1").text();
        const orjprice =
            $("ul.list-unstyled li span.pro_price").text()
        const price = orjprice
        const description = $("#tab-description").text();
        const propiteam = "item";
        var images = [];
        $(
            "div#additional-carousel div.image-additional"
        )
            .map((index, element) => {
                images.push($(element).find("a").attr("href"));
            });
        var imageUrl = images[0];

        const colors = [];
        const sizes = [];
        $("div.radio").map((index, element) => {
            sizes.push($(element).find("label").text())
        });
        productsDetails.push({
            name,
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
    try {
        const response = await axios.get(link);

        const outerhtml = response.data;

        const dataTable = cheerio(
            "div.row.category-row > div.product-layout.product-list.col-xs-12",
            outerhtml
        );
        dataTable.each(function () {
            const productUrl = cheerio(this)
                .find("a")
                .attr("href");
            urls.push(productUrl);
        });
        console.log(urls.length)
        // return await getProduct(urls[0]);
        return Promise.all(urls.map((url) => getProduct(url, link)));
    } catch (error) {
        console.error(error);
    }
}
module.exports = {
    getProductsData,
};
