const axios = require("axios");
var cheerio = require("cheerio");
const url = "https://www.e-bebek.com/bebek-giyim-c4050";
const baseURL = "https://www.e-bebek.com";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
if (typeof cheerio != "function") cheerio = require("cheerio").default;
async function getProduct(prodURL, link) {
	const sku = prodURL.split("-").pop()
	try {
		const { data } = await axios.get(`https://api2.e-bebek.com/ebebekwebservices/v2/ebebek/products/${sku}`)
		const productsDetails = [];
		const product_source = "ebebek";
		const group_url = link;
		const propiteam = "";
		let images = [];
		let imageUrl = "";
		const brand = data.brandName
		const name = data.name
		let orjprice = data.price.formattedValue
		let price = data.discountRate === 0 ? data.price.formattedValue : data.discountedPrice.formattedValue
		const sizes = []
		const colors = []
		const description = ''

		data.baseOptions[0].options.forEach(e => {
			if (e.stock.stockLevel > 0) {
				sizes.push(e.variantOptionQualifiers.find(n => n.name === "Size").value)
			}
		});


		colors.push(data.baseOptions[0].options[0].variantOptionQualifiers.find(n => n.name === "Color").value)
		data.images.forEach(e => {
			if (e.format === "superZoom") {
				images.push(e.url)

			}
		})


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
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

		const response = await axios.get(link);

		const outerhtml = response.data;

		const dataTable = cheerio(".product-list eb-product-list-item", outerhtml);
		dataTable.each(function () {
			const productUrl = baseURL + cheerio(this).find("a").attr("href");
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
