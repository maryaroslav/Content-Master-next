import SearchResults from './components/SearchResults';

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
    const { q } = await searchParams;
    return <SearchResults query={typeof q === 'string' ? q : ''} />;
}
