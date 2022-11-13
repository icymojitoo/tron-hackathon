import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { signIn } from 'next-auth/react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

function SignIn() {
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { push } = useRouter();

    const handleAuth = async () => {
        if (isConnected) {
            await disconnectAsync();
        }

        const { account, chain } = await connectAsync({ connector: new MetaMaskConnector() });

        const userData = { address: account, chain: chain.id, network: 'evm' };

        const { data } = await axios.post('/api/auth/request-message', userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const message = data.message;

        const signature = await signMessageAsync({ message });

        // redirect user after success authentication to '/user' page
        const { url } = await signIn('credentials', { message, signature, redirect: false, callbackUrl: '/webapp' });
        /**
         * instead of using signIn(..., redirect: "/user")
         * we get the url from callback and push it to the router to avoid page refreshing
         */
        push(url);
    };

    return (        <div id="page-container">
    <div id="content-wrap">
        <div className="navbar bg-base-100">
            <a className="btn btn-ghost normal-case text-xl">GenZ Portfolio & NFTs</a>
        </div>
        <main className='mt-8'>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                    <h1 className="text-5xl font-bold">GenZ Portfolio & NFTs</h1>
                    <p className="py-6">GenZ Portfolio and NFTs provides an easy solution for creating annd selling NFTs for generic use cases which doesnot require you to create a new collection or roam platform to platform to sell.</p>
                    <p className="py-6 mt-2">All of it is done on one site that is GenZ.</p>
                    <p className="py-6 mt-2">We also provide easy view into your metamask wallet to see what assets you have available.</p>
                    <button className="btn btn-primary" onClick={() => handleAuth()}>Connect Metamask</button>
                    </div>
                </div>
            </div>
        </main>
      </div>
      <div id="footer">
          <footer className="footer footer-center p-4 bg-base-300 text-base-content">
              <div>
                  <p>Copyright © 2022 - All right reserved by Momo</p>
              </div>
          </footer>
      </div>
  </div>
    );
}

export default SignIn;

