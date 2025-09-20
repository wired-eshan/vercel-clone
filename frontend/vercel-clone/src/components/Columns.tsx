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
  gitUrl: string;
}

export type ProjectAnalytics = {
  id : string;
  name: string;
  gitUrl: string;
  visits: number;
}

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gitUrl",
    header: "Git Repository",
  }
];

export const projectAnalyticsColumns: ColumnDef<ProjectAnalytics>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gitUrl",
    header: "Git Repository",
  },
  {
    accessorKey: "visits",
    header: "visits"
  }
];

export const deploymentColumns: ColumnDef<Deployment>[] = [
  {
    accessorKey: "project.name",
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "TimeStamp",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "URL",
    header: "URL",
  },
];
