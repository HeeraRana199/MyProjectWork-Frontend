import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssociateByIdAdmin } from '../store/slices/adminSlice';
import TalentCard from '../components/talent-card/TalentCard';

const AdminTalentCard = () => {
  const { associateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCandidate, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    if (associateId) {
      dispatch(getAssociateByIdAdmin(parseInt(associateId)));
    }
  }, [associateId, dispatch]);

  return (
    <TalentCard
      role="admin"
      associateId={associateId}
      candidate={currentCandidate}
      loading={loading}
      error={error}
      onBack={() => navigate('/admin/dashboard')}
    />
  );
};

export default AdminTalentCard;
