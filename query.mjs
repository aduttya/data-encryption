import Query from "@irys/query";
const myQuery = new Query();



async function main(){
    const results = await myQuery
	.search("irys:transactions")
	.tags([{ name: "Content-Type", values: ["image/png"] }]);
}


main()