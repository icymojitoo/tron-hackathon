import Link from 'next/link'
import { signOut } from "next-auth/react";

export default function Layout(props) {

    return (
        <div id="page-container">
            <div id="content-wrap">
                <header>
                    <div className="navbar bg-base-100">
                        <div className="navbar-start">
                            <div className="dropdown">
                            <label tabIndex={0} className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                            </label>
                            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">  
                                <li><Link href="/portfolio">Portfolio</Link></li>                    
                                <li><Link href="/webapp">Marketplace</Link></li>
                                <li><Link href="my-assets">My NFTs</Link></li>
                                <li><Link href="/create-item">Create</Link></li>
                                <li><Link href="/user">Creator Dashboard</Link></li>
                            </ul>
                            </div>
                            <Link href="/portfolio" className="btn btn-ghost normal-case text-xl">Sunrise Portfolio & NFTs</Link>
                        </div>
                        <div className="navbar-center hidden lg:flex">
                            <ul className="menu menu-horizontal p-0">    
                            <li><Link href="/portfolio">Portfolio</Link></li>                    
                            <li><Link href="/webapp">Marketplace</Link></li>
                            <li><Link href="my-assets">My NFTs</Link></li>
                            <li><Link href="/create-item">Create</Link></li>
                            <li><Link href="/user">Creator Dashboard</Link></li>
                            </ul>
                        </div>
                        <div className="navbar-end">
                            <button className="btn" onClick={() => signOut({redirect: '/signin'})}>Disonnect</button>
                        </div>
                    </div>
                </header>
                <main className='mt-8'>
                    {props.children}
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
    )
}
