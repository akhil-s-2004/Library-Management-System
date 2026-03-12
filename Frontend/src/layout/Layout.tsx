import React from 'react'
import Header from '../components/header/Header';
import { Outlet } from 'react-router';
import Footer from '../components/Footer';
const layout = () => {
  return (
    <div className='flex flex-col justify-between min-h-screen bg-[#FFF3F3]'>
      <Header />
      <main className='flex-grow mb-10'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default layout