import type { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Deployment = {
  id : string;
  project: string;
  status: "Not Started" | "Queued" | "Building" | "Successful" | "Failed";
  timeStamp: number;
  URL: string;
};

export type Project = {
  id : string;
  name: string;
  gitRepo: string;
  active: boolean;
  URL: string;
}

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gitRepo",
    header: "Git Repo",
  }
];

export const deploymentColumns: ColumnDef<Deployment>[] = [
  {
    accessorKey: "project",
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "timeStamp",
    header: "TimeStamp",
    cell: ({ row }) => {
      const date = new Date(row.getValue("timeStamp"));
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "URL",
    header: "URL",
  },
];
