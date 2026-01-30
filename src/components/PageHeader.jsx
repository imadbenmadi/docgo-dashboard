import { useNavigation } from "../context/NavigationContext";

const PageHeader = () => {
    const { pageTitle } = useNavigation();

    return (
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {pageTitle}
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>
    );
};

export default PageHeader;
