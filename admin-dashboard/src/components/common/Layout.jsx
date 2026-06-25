import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import {
  SidebarProvider,
  useSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from '../../context/SidebarContext';

function LayoutContent({ children }) {
  const { collapsed } = useSidebar();
  const sidebarOffset = collapsed ? SIDEBAR_WIDTH_COLLAPSED + 32 : SIDEBAR_WIDTH_EXPANDED + 32;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          p: { xs: 2, sm: 3, lg: 4 },
          ml: { xs: 0, lg: `${sidebarOffset}px` },
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}

function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

export default Layout;
