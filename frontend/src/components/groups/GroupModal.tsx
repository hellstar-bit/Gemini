// frontend/src/components/groups/GroupModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import groupsService, { type Group, type CreateGroupDto } from '../../services/groupsService';
import candidatesService, { type Candidate } from '../../services/candidatesService';

interface GroupModalProps {
  group: Group | null;
  onClose: () => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({ group, onClose }) => {
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: '',
    description: '',
    zone: '',
    meta: 0,
    candidateId: 0,
    isActive: true,
  });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const response = await candidatesService.getAll({}, 1, 100);
        setCandidates(response.data);
      } catch (error) {
        console.error('Error loading candidates:', error);
      }
    };
    loadCandidates();
  }, []);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        zone: group.zone || '',
        meta: group.meta,
        candidateId: group.candidateId,
        isActive: group.isActive,
      });
    }
  }, [group]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.candidateId) {
      newErrors.candidateId = 'Debe seleccionar un candidato';
    }

    if (formData.meta < 0) {
      newErrors.meta = 'La meta no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (group) {
        await groupsService.update(group.id, formData);
      } else {
        await groupsService.create(formData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving group:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar grupo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'meta' || name === 'candidateId' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {group ? 'Editar Grupo' : 'Nuevo Grupo'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                errors.name ? 'border-red-300' : ''
              }`}
              placeholder="Nombre del grupo"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Candidato *</label>
            <select
              name="candidateId"
              value={formData.candidateId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                errors.candidateId ? 'border-red-300' : ''
              }`}
            >
              <option value="">Seleccionar candidato</option>
              {candidates.map(candidate => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
            {errors.candidateId && <p className="mt-1 text-sm text-red-600">{errors.candidateId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zona</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Zona geográfica"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meta</label>
              <input
                type="number"
                name="meta"
                value={formData.meta}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                  errors.meta ? 'border-red-300' : ''
                }`}
                placeholder="0"
              />
              {errors.meta && <p className="mt-1 text-sm text-red-600">{errors.meta}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Descripción del grupo..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Grupo activo</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : group ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};