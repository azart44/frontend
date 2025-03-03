import { useState, useCallback } from 'react';

/**
 * Type pour les règles de validation
 * Chaque fonction reçoit une valeur et retourne null si valide ou un message d'erreur
 */
type ValidationRule<T> = (value: any) => string | null;
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>;

/**
 * Hook personnalisé pour gérer les formulaires avec validation
 * @param initialValues Valeurs initiales du formulaire
 * @returns Objet contenant les valeurs, erreurs et fonctions de gestion du formulaire
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  // Gestionnaire pour les champs de formulaire
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Gérer différents types de champs
    let fieldValue: any = value;
    
    // Gérer spécifiquement les checkbox (uniquement pour HTMLInputElement)
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      fieldValue = e.target.checked;
    }
    
    setValues(prev => ({ 
      ...prev, 
      [name]: fieldValue 
    }));
    
    // Marquer le champ comme touché
    setTouched(prev => ({ 
      ...prev, 
      [name]: true 
    }));
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name as keyof T]) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: undefined 
      }));
    }
  }, [errors]);
  
  // Gestionnaire pour la perte de focus
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({ 
      ...prev, 
      [name]: true 
    }));
  }, []);
  
  // Validation du formulaire avec règles personnalisées
  const validate = useCallback((validationRules: ValidationRules<T> = {}) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    // Vérifier chaque règle
    Object.keys(validationRules).forEach((key) => {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(values[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values]);
  
  // Définir une valeur unique
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Effacer l'erreur associée
    if (errors[name]) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: undefined 
      }));
    }
  }, [errors]);
  
  // Réinitialiser le formulaire
  const resetForm = useCallback((newValues: Partial<T> = {}) => {
    setValues({ ...initialValues, ...newValues });
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setValues,
    validate,
    resetForm,
  };
}