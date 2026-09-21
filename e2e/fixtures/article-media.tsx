import React from 'react';
import { createRoot } from 'react-dom/client';
import { FormProvider, useForm } from 'react-hook-form';
import { Toaster } from 'sonner';
import { ImageField } from '../../src/components/article/ArticleFormFields';
import ArticleImage from '../../src/components/article/ArticleImage';
import ArticleCardHeader from '../../src/components/article/ArticleCardHeader';
import '../../src/index.css';

export function Fixture() {
  const form = useForm({ defaultValues: { imageUrl: '' } });
  const url = form.watch('imageUrl');
  return <main style={{ maxWidth: 640, margin: '24px auto' }}>
    <FormProvider {...form}><ImageField /></FormProvider>
    <h2>Article</h2>
    <ArticleImage imageUrl={url} sourceUrl={null} title="Test video" getImageUrl={u => u} />
    <h2>Article card</h2>
    <ArticleCardHeader articleId="test" imageUrl={url} title="Test video" isGif={url.endsWith('.gif')} getImageUrl={u => u} />
    <Toaster />
  </main>;
}

createRoot(document.getElementById('root')!).render(<Fixture />);
