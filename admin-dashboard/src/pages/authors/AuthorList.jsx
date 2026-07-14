import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import AuthorBulkImport from '../../components/authors/AuthorBulkImport';
import { colors } from '../../theme/colors';

function AuthorList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading, error } = useQuery({
    queryKey: ['authors', page, rowsPerPage, search],
    queryFn: () =>
      adminApi.getAuthors({
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteAuthor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.refetchQueries({ queryKey: ['authors'] });
    },
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert('Error: ' + (err.message || 'Failed to delete author'));
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

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const authors = data?.data || [];
  const meta = data?.meta || {};
  const total = meta.total ?? 0;

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
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ color: colors.navy }}>
            Authors
          </Typography>
          <Button
            component={Link}
            to="/dashboard/authors/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Add Author
          </Button>
        </Box>

        <AuthorBulkImport />

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
            <TextField
              size="small"
              label="Search authors"
              value={search}
              onChange={handleSearchChange}
              placeholder="Filter by name..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 320 }, bgcolor: '#fff', borderRadius: 1 }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              Error loading authors: {error.message}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: colors.redOrange }} />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ minWidth: 640 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(30, 61, 89, 0.06)' }}>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.navy, width: 200 }}>
                        Slug
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: colors.navy, width: 120 }}
                        align="center"
                      >
                        Series
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 600, color: colors.navy, width: 100 }}
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {authors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: colors.muted }}>
                          No authors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      authors.map((author) => (
                        <TableRow key={author.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={author.image_url || undefined}
                                alt={author.name}
                                sx={{ width: 40, height: 40, bgcolor: colors.almond }}
                              >
                                {author.name?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600} sx={{ color: colors.navy }}>
                                {author.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: colors.muted }}>
                              {author.slug}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: colors.muted }}>
                              {author.series_count || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              component={Link}
                              to={`/dashboard/authors/${author.id}/edit`}
                              size="small"
                              aria-label={`Edit ${author.name}`}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={`Delete ${author.name}`}
                              onClick={() => handleDelete(author.id, author.name)}
                              disabled={deleteMutation.isPending}
                            >
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}

export default AuthorList;
