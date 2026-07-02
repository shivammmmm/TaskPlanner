import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { Employee } from '../types/entities';

export default function useCurrentEmployee() {
  const { user, isAuthenticated } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        // Lookup employee by user_id — the backend now supports this filter
        const emps = await authService.filterEmployees({ user_id: user.id });
        if (emps.length > 0) {
          setEmployee(emps[0]);
        } else {
          console.warn('No employee profile found for user:', user.email);
        }
      } catch (error) {
        console.error('Failed to load current employee info:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isAuthenticated]);

  const isAdmin = employee?.role === 'super_admin' || employee?.role === 'company_admin';
  const isManager = isAdmin || employee?.role === 'manager';
  const isTeamLead = isManager || employee?.role === 'team_leader';

  return { employee, user, loading, isAdmin, isManager, isTeamLead };
}
