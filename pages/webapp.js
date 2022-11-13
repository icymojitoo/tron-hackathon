import Layout from '../components/layout'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { getSession } from "next-auth/react";

import { nftmarketaddress, nftaddress } from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'



export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1576d615d66a46a7813ada9e4f487da9")

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    
    const data = await marketContract.fetchMarketItems()

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
    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft) {
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    
    loadNFTs()
  }

  return (
    <Layout>
      <div>
        <div className='text-center'>
          NFTs for sale
        </div>
        {
          loadingState === 'loaded' && !nfts.length && (
            <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
          )
        }
        <div className='flex justify-center m-8'>
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4'>
            {
              nfts.map((nft, i) => (
                <div key={i} className='card w-96 bg-base-100 shadow-xl hover:bg-base-200 m-4'>
                  <figure><img className="max-h-48 rounded m-4" src={nft.image} alt={i} /></figure>
                  <div className='card-body'>
                    <h2 className='card-title'>{nft.name}</h2>
                    <p>{nft.description}</p>
                    <p className='text-xl font-bold text-primary'>
                        {nft.price} MATIC
                    </p>
                    <div className='card-actions justify-end'>
                      <button className='btn btn-primary' onClick={() => buyNft(nft)}>
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
            ))
            }
          </div>
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
