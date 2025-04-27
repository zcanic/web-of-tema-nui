import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function NewPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });

  const { addBlogPost } = useApp();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
      if (file) {
         alert('请选择图片文件喵！');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setSubmitStatus({ message: '标题和内容都不能为空哦喵！', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ message: '正在处理喵...', type: 'info' });

    let imageUrl = null;

    try {
      if (imageFile) {
        setSubmitStatus({ message: '正在上传图片喵...', type: 'info' });
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || '图片上传失败了喵 T_T');
        }
        
        imageUrl = uploadResult.imageUrl;
        console.log('图片上传成功，URL:', imageUrl);
        setSubmitStatus({ message: '图片上传成功！正在保存日记...', type: 'info' });
      }

      console.log("准备提交博客:", { title, content, imageUrl });
      await addBlogPost({ title, content, imageUrl });

      setSubmitStatus({ message: '日记保存成功喵！正在跳转...', type: 'success' });
      setTimeout(() => {
        navigate('/blog');
      }, 1500);

    } catch (error) {
      console.error("提交日记时出错喵:", error);
      setSubmitStatus({ message: `操作失败喵 T_T: ${error.message}`, type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">写点什么呢，主人？🖋️</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            标题喵~
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 disabled:opacity-50"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            配图喵~
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 disabled:opacity-50"
            disabled={isSubmitting}
          />
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Image preview" className="max-h-60 rounded-md border dark:border-gray-600" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            内容喵~ (支持 Markdown 哦)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 disabled:opacity-50"
            required
            disabled={isSubmitting}
          />
        </div>

        {submitStatus.message && (
          <p className={`text-sm ${submitStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : (submitStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400')}`}>
            {submitStatus.message}
          </p>
        )}

        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '处理中...' : '保存日记喵~'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewPostForm; 