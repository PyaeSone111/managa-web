import { Link, useLocation } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useAuth } from '../../context/AuthContext';
import {
  useSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from '../../context/SidebarContext';
import { colors } from '../../theme/colors';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
  { path: '/dashboard/series', label: 'Series', icon: MenuBookOutlinedIcon },
  { path: '/dashboard/chapters', label: 'Chapters', icon: ArticleOutlinedIcon },
  { path: '/dashboard/categories', label: 'Categories', icon: CategoryOutlinedIcon },
  { path: '/dashboard/tags', label: 'Tags', icon: LocalOfferOutlinedIcon },
  { path: '/dashboard/authors', label: 'Authors', icon: PersonOutlineOutlinedIcon },
  { path: '/dashboard/manga-types', label: 'Manga Types', icon: StyleOutlinedIcon },
  { path: '/dashboard/themes', label: 'Themes', icon: PaletteOutlinedIcon },
  { path: '/dashboard/branding', label: 'Branding', icon: ImageOutlinedIcon },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.charAt(0).toUpperCase();
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const renderNavItem = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    const linkContent = (
      <Box
        component={Link}
        to={item.path}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed ? 1.25 : 2,
          py: 1.25,
          borderRadius: 2,
          textDecoration: 'none',
          color: active ? colors.white : 'rgba(245, 240, 225, 0.75)',
          bgcolor: active ? colors.redOrange : 'transparent',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: active ? colors.redOrangeHover : 'rgba(255, 255, 255, 0.08)',
            color: colors.white,
          },
        }}
      >
        <Icon sx={{ fontSize: 22, flexShrink: 0 }} />
        {!collapsed && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.label}
          </Typography>
        )}
      </Box>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} title={item.label} placement="right" arrow>
          {linkContent}
        </Tooltip>
      );
    }

    return <Box key={item.path}>{linkContent}</Box>;
  };

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        top: 16,
        left: 16,
        bottom: 16,
        width: sidebarWidth,
        zIndex: 40,
        bgcolor: colors.navy,
        borderRadius: 3,
        boxShadow: '0 8px 30px rgba(30, 61, 89, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1.5 : 2.5,
          pt: 2.5,
          pb: 2,
          minHeight: 72,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(255, 110, 64, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AutoStoriesOutlinedIcon sx={{ color: colors.mango, fontSize: 22 }} />
          </Box>
          {!collapsed && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.almond,
                fontSize: '1.15rem',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Manga Admin
            </Typography>
          )}
        </Box>

        {!collapsed && (
          <IconButton
            size="small"
            onClick={toggle}
            sx={{
              color: 'rgba(245, 240, 225, 0.6)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
          <IconButton
            size="small"
            onClick={toggle}
            sx={{
              color: 'rgba(245, 240, 225, 0.6)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 2 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              px: 1,
              mb: 1,
              color: 'rgba(245, 240, 225, 0.45)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: '0.68rem',
            }}
          >
            MENU
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map(renderNavItem)}
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          p: collapsed ? 1.5 : 2,
        }}
      >
        {collapsed ? (
          <Tooltip title="Logout" placement="right" arrow>
            <IconButton
              onClick={logout}
              sx={{
                width: '100%',
                borderRadius: 2,
                color: 'rgba(245, 240, 225, 0.75)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
            onClick={logout}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: colors.redOrange,
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: colors.almond, lineHeight: 1.3 }}
                noWrap
              >
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(245, 240, 225, 0.55)' }}>
                Super Admin
              </Typography>
            </Box>
            <LogoutOutlinedIcon sx={{ color: 'rgba(245, 240, 225, 0.45)', fontSize: 18 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Sidebar;
