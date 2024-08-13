import { useQueryClient } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';

import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { flagsHooks } from '@/hooks/flags-hooks';
import { projectHooks } from '@/hooks/project-hooks';
import { ApFlagId, ProjectMemberRole } from '@activepieces/shared';

type ProjectRoleSelectProps = {
  form: UseFormReturn<any>;
};

const RolesDisplayNames: { [k: string]: string } = {
  [ProjectMemberRole.ADMIN]: `Admin`,
  [ProjectMemberRole.EDITOR]: `Editor`,
  [ProjectMemberRole.OPERATOR]: `Operator`,
  [ProjectMemberRole.VIEWER]: `Viewer`,
};

const ProjectRoleSelect = ({ form }: ProjectRoleSelectProps) => {
  const queryClient = useQueryClient();
  const { project } = projectHooks.useCurrentProject();

  const { data: isCloudPlatform } = flagsHooks.useFlag<boolean>(
    ApFlagId.IS_CLOUD_PLATFORM,
    queryClient,
  );

  const invitationRoles = Object.values(ProjectMemberRole)
    .filter((f) => {
      if (f === ProjectMemberRole.ADMIN) {
        return true;
      }
      const showNonAdmin =
        !isCloudPlatform || project?.plan.teamMembers !== 100;
      return showNonAdmin;
    })
    .map((role) => {
      return {
        value: role,
        name: RolesDisplayNames[role],
      };
    })
    .map((r) => {
      return (
        <SelectItem key={r.value} value={r.value}>
          {r.name}
        </SelectItem>
      );
    });

  return (
    <FormField
      control={form.control}
      name="projectRole"
      render={({ field }) => (
        <FormItem className="grid gap-3">
          <Label>Project Role</Label>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Project Role</SelectLabel>
                {invitationRoles}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    ></FormField>
  );
};

export { ProjectRoleSelect };