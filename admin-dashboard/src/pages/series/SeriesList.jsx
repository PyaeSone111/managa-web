import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import { colors } from '../../theme/colors';

const STATUS_COLORS = {
  ongoing: 'success',
  completed: 'secondary',
  hiatus: 'warning',
  cancelled: 'default',
};

function getAuthorLabel(item) {
  if (item.author) return item.author;
  if (item.authors?.length) return item.authors.map((a) => a.name).join(', ');
  return '—';
}

function getMangaTypes(item) {
  return item.manga_types || item.mangaTypes || [];
}

function SeriesList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [titleSearch, setTitleSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const queryClient = useQueryClient();

  const hasFilters = Boolean(titleSearch || authorSearch || typeFilter);

  const { data: mangaTypesData } = useQuery({
    queryKey: ['manga-types'],
    queryFn: () => adminApi.getMangaTypes(),
  });

  const mangaTypeOptions = mangaTypesData?.data || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-series', page, rowsPerPage, titleSearch, authorSearch, typeFilter],
    queryFn: () =>
      adminApi.getSeries({
        page: page + 1,
        per_page: rowsPerPage,
        search: titleSearch || authorSearch || undefined,
        types: typeFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteSeries(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-series'] });
      queryClient.refetchQueries({ queryKey: ['admin-series'] });
    },
  });

  const series = data?.data || [];
  const pagination = data?.pagination || {};

  const filteredSeries = useMemo(() => {
    return series.filter((item) => {
      const titleMatch =
        !titleSearch ||
        item.title?.toLowerCase().includes(titleSearch.toLowerCase());
      const authorMatch =
        !authorSearch ||
        getAuthorLabel(item).toLowerCase().includes(authorSearch.toLowerCase());
      const typeMatch =
        !typeFilter ||
        getMangaTypes(item).some((t) => String(t.id) === String(typeFilter));
      return titleMatch && authorMatch && typeMatch;
    });
  }, [series, titleSearch, authorSearch, typeFilter]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert('Failed to delete series: ' + err.message);
      }
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setTitleSearch('');
    setAuthorSearch('');
    setTypeFilter('');
    setPage(0);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(0);
  };

  const searchFieldSx = {
    width: '100%',
    bgcolor: '#fff',
    borderRadius: 1,
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            width: '100%',
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ color: colors.navy }}>
            Series Management
          </Typography>
          <Button
            component={Link}
            to="/dashboard/series/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Add New Series
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            border: '1px solid',
            borderColor: colors.almondBorder,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: colors.almondBorder,
              bgcolor: 'rgba(30, 61, 89, 0.04)',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg: 'minmax(200px, 1fr) minmax(200px, 1fr) minmax(160px, 220px) auto',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                label="Search title"
                value={titleSearch}
                onChange={handleFilterChange(setTitleSearch)}
                placeholder="Filter by title..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={searchFieldSx}
              />
              <TextField
                size="small"
                label="Search author"
                value={authorSearch}
                onChange={handleFilterChange(setAuthorSearch)}
                placeholder="Filter by author..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={searchFieldSx}
              />
              <TextField
                select
                size="small"
                label="Manga type"
                value={typeFilter}
                onChange={handleFilterChange(setTypeFilter)}
                sx={searchFieldSx}
              >
                <MenuItem value="">All types</MenuItem>
                {mangaTypeOptions.map((type) => (
                  <MenuItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              {hasFilters && (
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ textTransform: 'none', justifySelf: { lg: 'start' } }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              Error loading series: {error.message}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: colors.redOrange }} />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(30, 61, 89, 0.06)' }}>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 80 }}>
                        Thumbnail
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 160 }}>
                        Author
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 180 }}>
                        Types
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 120 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 90 }} align="center">
                        Chapters
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 100 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSeries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: colors.muted }}>
                          {hasFilters
                            ? 'No series match your filters.'
                            : 'No series found. Create your first series!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSeries.map((item) => {
                        const types = getMangaTypes(item);

                        return (
                          <TableRow
                            key={item.id}
                            hover
                            sx={{ '&:last-child td': { borderBottom: 0 } }}
                          >
                            <TableCell>
                              <Box
                                component="img"
                                src={item.thumbnail_url || '/placeholder.jpg'}
                                alt={item.title}
                                sx={{
                                  width: 48,
                                  height: 64,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: `1px solid ${colors.almondBorder}`,
                                  display: 'block',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} sx={{ color: colors.navy }}>
                                {item.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: colors.muted }}>
                                {getAuthorLabel(item)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {types.length > 0 ? (
                                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                  {types.map((t) => (
                                    <Chip
                                      key={t.id}
                                      label={t.name}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.75rem' }}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" sx={{ color: colors.muted }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                size="small"
                                color={STATUS_COLORS[item.status] || 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ color: colors.muted }}>
                                {item.total_chapters}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                                <Tooltip title="Edit series">
                                  <IconButton
                                    component={Link}
                                    to={`/dashboard/series/${item.id}/edit`}
                                    size="small"
                                    sx={{
                                      color: colors.navy,
                                      border: `1px solid ${colors.navy}40`,
                                      borderRadius: 1,
                                      '&:hover': {
                                        bgcolor: `${colors.navy}14`,
                                        borderColor: colors.navy,
                                      },
                                    }}
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete series">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(item.id, item.title)}
                                    disabled={deleteMutation.isPending}
                                    sx={{
                                      color: '#dc2626',
                                      border: '1px solid rgba(220, 38, 38, 0.3)',
                                      borderRadius: 1,
                                      '&:hover': {
                                        bgcolor: 'rgba(220, 38, 38, 0.08)',
                                        borderColor: '#dc2626',
                                      },
                                    }}
                                  >
                                    <DeleteOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={pagination.total ?? 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: colors.almondBorder,
                }}
              />
            </>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}

export default SeriesList;
