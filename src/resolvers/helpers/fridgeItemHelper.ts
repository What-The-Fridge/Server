import axios from 'axios';

/**
 * Fetch fridge/food item info through UPC
 * TODO: handle the err
 * @param upc barcode number of the item
 * @return itemInfo in JSON formatted string if success, otherwise return false
 */
export async function fetchItemInfoByUPC(upc: string): Promise<false | any> {
	if (!upc) {
		return false;
	}

	const url = `https://trackapi.nutritionix.com/v2/search/item?upc=${upc}`;

	const config = {
		headers: {
			'x-app-id': process.env.XAPPID!,
			'x-app-key': process.env.XAPPKEY!,
		},
	};

	try {
		const itemInfo: any = await axios.get(url, config);

		if (itemInfo.data?.foods[0]) {
			return itemInfo.data?.foods[0];
		} else {
			console.log('empty food item returned from API');
			return false;
		}
	} catch (err) {
		return false;
	}
}
