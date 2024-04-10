import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        let sumPrice = 0;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        let transaction = await contract.getMyNFTs();
        
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            sumPrice += Number(price);
            return item;
        }));

        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched) getNFTData(tokenId);

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-8 text-white">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Wallet Address</h2>
                        <p>{address}</p>
                    </div>
                    <div className="flex flex-row justify-center space-x-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">No. of NFTs</h2>
                            <p>{data.length}</p>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Total Value</h2>
                            <p>{totalPrice} ETH</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Your NFTs</h2>
                        <div className="flex justify-center flex-wrap max-w-screen-xl">
                            {data.map((value, index) => {
                                return <NFTTile data={value} key={index}></NFTTile>;
                            })}
                        </div>
                        <div className="mt-4 text-xl">
                            {data.length === 0 ? "Oops, Log In To View" : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
