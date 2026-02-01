"use client";

import {
  useNonFunctionalModules,
  useUpdateNonFunctionalModules,
  useNonFunctionalModuleTemplates,
  useUpdateNonFunctionalModuleTemplates,
} from "@/hooks/useTestData";
import TestingModulesManager from "./TestingModulesManager";
import {
  FunctionalModule,
  FunctionalModuleTemplate,
} from "@/types/functional-module";

interface NonFunctionalModulesManagerProps {
  projectId: string;
}

export default function NonFunctionalModulesManager({
  projectId,
}: NonFunctionalModulesManagerProps) {
  const { data: modules, isLoading: modulesLoading } =
    useNonFunctionalModules(projectId);
  const { data: templates, isLoading: templatesLoading } =
    useNonFunctionalModuleTemplates(projectId);
  const updateModulesMutation = useUpdateNonFunctionalModules(projectId);
  const updateTemplatesMutation =
    useUpdateNonFunctionalModuleTemplates(projectId);

  const handleSaveModules = async (modules: FunctionalModule[]) => {
    await updateModulesMutation.mutateAsync(modules);
  };

  const handleSaveTemplates = async (templates: FunctionalModuleTemplate[]) => {
    await updateTemplatesMutation.mutateAsync(templates);
  };

  return (
    <TestingModulesManager
      projectId={projectId}
      moduleType="non-functional"
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
