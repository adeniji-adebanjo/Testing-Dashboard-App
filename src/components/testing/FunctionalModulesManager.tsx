"use client";

import {
  useFunctionalModules,
  useUpdateFunctionalModules,
  useFunctionalModuleTemplates,
  useUpdateFunctionalModuleTemplates,
} from "@/hooks/useTestData";
import TestingModulesManager from "./TestingModulesManager";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
} from "@/types/functional-module";

interface FunctionalModulesManagerProps {
  projectId: string;
}

export default function FunctionalModulesManager({
  projectId,
}: FunctionalModulesManagerProps) {
  const { data: modules, isLoading: modulesLoading } =
    useFunctionalModules(projectId);
  const { data: templates, isLoading: templatesLoading } =
    useFunctionalModuleTemplates(projectId);
  const updateModulesMutation = useUpdateFunctionalModules(projectId);
  const updateTemplatesMutation = useUpdateFunctionalModuleTemplates(projectId);

  const handleSaveModules = async (modules: FunctionalModule[]) => {
    await updateModulesMutation.mutateAsync(modules);
  };

  const handleSaveTemplates = async (templates: FunctionalModuleTemplate[]) => {
    await updateTemplatesMutation.mutateAsync(templates);
  };

  return (
    <TestingModulesManager
      projectId={projectId}
      moduleType="functional"
      modules={modules}
      templates={templates}
      isLoading={modulesLoading || templatesLoading}
      onSaveModules={handleSaveModules}
      onSaveTemplates={handleSaveTemplates}
      isSaving={
        updateModulesMutation.isPending || updateTemplatesMutation.isPending
      }
    />
  );
}
