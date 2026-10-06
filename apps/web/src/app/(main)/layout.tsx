import HeaderMain from '@/components/headers/HeaderMain';
import NavBar from '@/components/navbars/NavBar';
import NavBarLeft from '@/components/navbars/NavBarLeft';
import NavBarRight from '@/components/navbars/NavBarRight';

import '../../styles/main.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-layout">
            <HeaderMain />
            <NavBar />
            <div className="main-info-container">
                <div className="sidebar-fixed">
                    <NavBarLeft />
                </div>
                <div className="content-scrollable">
                    {children}
                </div>
                <NavBarRight />
            </div>
        </div>
    );
}
