import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from 'ethers';

export default function Marketplace() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const[walletConnect,setWalletConnect]= useState()

    async function getAllNFTs() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let transaction = await contract.getAllNFTs();
            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
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
                return item;
            }));
            localStorage.setItem('localNfts', JSON.stringify(items));
            updateFetched(true);
            updateData(items);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        }
    }

    useEffect(() => {
        console.log('get nft called');
        getAllNFTs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar/>
            <div className="container mx-auto px-4 py-12">
                <div className="text-center text-white text-2xl font-bold mb-8">
                    Top NFTs
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((value, index) => {
                        return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
            </div>            
        </div>
    );
}
