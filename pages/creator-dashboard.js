import Layout from '../components/layout'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { getSession, signOut } from "next-auth/react";


import { nftmarketaddress, nftaddress } from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

        const data = await marketContract.fetchItemsCreated()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      
            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description
            }
      
            return item
        }));

        const soldItems = items.filter(i => i.sold)
        setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')     
    }
    return (
        <Layout>
            <div>
                <div className='text-center'>
                    My Created
                </div>
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
                                {nft.price} MATIC
                            </p>
                        </div>
                    </div>
                    </div>
                ))
                }
                </div>
            </div>
            <div>
                <div>
                    {
                        Boolean(sold.length) && (
                            <div>
                                <h2>Items Sold</h2>
                                <div className="flex justify-center">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                                        {
                                        sold.map((nft, i) => (
                                            <div key={i} className='card w-96 bg-base-100 shadow-xl'>
                                                <figure><img src={nft.image} alt={i} /></figure>
                                                <div className='card-body'>
                                                    <h2 className='card-title'>{nft.name}</h2>
                                                    <p>{nft.description}</p>
                                                    <div className='card-actions justify-end'>
                                                        <p className='text-xl font-bold text-primary'>
                                                            {nft.price} BNB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
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
