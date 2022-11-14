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

    return (        
        <div id="page-container">
            <div id="content-wrap">
                <div className="navbar bg-base-100">
                    <div className="navbar-start">
                        <div className="dropdown">
                        <label tabIndex={0} className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                        </label>
                        <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/oportfolio">Portfolio</Link></li>
                        </ul>
                        </div>
                        <Link href="/webapp" className="btn btn-ghost normal-case text-xl">Sunrise Portfolio & NFTs</Link>
                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal p-0">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/oportfolio">Portfolio</Link></li>
                        </ul>
                    </div>
                    <div className="navbar-end">
                    </div>
                </div>
                <main className='mt-8'>
                    <div className="hero min-h-screen bg-base-200">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                            <h1 className="text-5xl font-bold">Sunrise Portfolio & NFTs</h1>
                            <p className="py-6">Sunrise Portfolio and NFTs provides an easy solution for creating annd selling NFTs for generic use cases which doesnot require you to create a new collection or roam platform to platform to sell.</p>
                            <p className="py-6 mt-2">All of it is done on one site that is Sunrise.</p>
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

