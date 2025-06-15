"use client";

import React, { useState } from 'react';
import FloatingShareButton from './FloatingShareButton';
import ShareModal from './ShareModal';

interface BlogShareManagerProps {
  url: string;
  title: string;
  description?: string;
}

const BlogShareManager: React.FC<BlogShareManagerProps> = ({ 
  url, 
  title, 
  description = '' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <FloatingShareButton onClick={openModal} />
      <ShareModal 
        url={url} 
        title={title} 
        description={description} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </>
  );
};

export default BlogShareManager; 