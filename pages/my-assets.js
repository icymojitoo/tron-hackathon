import Layout from '../components/layout'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import axios from 'axios';
import { getSession } from "next-auth/react";

import { nftaddress, nftmarketaddress } from '../config';

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';

export default function MyAssets() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');
    
    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
        const data = await marketContract.fetchMyNFTs();
        console.log(data);

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
            }
            return item;
        }));
        console.log(items);
        setNfts(items);
        setLoadingState('loaded');
    }

    return (
        <Layout>
            <div>
                <div className='text-center'>
                    My NFTs
                </div>
                    {
                    loadingState === 'loaded' && !nfts.length && (
                        <h1 className="px-20 py-10 text-3xl">No assets owned</h1>
                    )
                    }
            </div>
            <div className="flex justify-center">
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                {
                nfts.map((nft, i) => (
                    <div key={i} className='card w-96 bg-base-100 shadow-xl'>
                    <figure><img src={nft.image} alt={i} /></figure>
                    <div className='card-body'>
                        <h2 className='card-title'>{nft.name}</h2>
                        <p>{nft.description}</p>
                        <div className='card-actions justify-end'>
                            <p className='text-xl font-bold text-primary'>
                                {nft.price} MATICs
                            </p>
                        </div>
                    </div>
                    </div>
                ))
                }
                </div>
            </div>
        </Layout>
    )

}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    // redirect if not authenticated
    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: { user: session.user }
    };
}
