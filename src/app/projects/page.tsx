import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

export const metadata: Metadata = {
  title: "项目",
  description: "正在制作和维护的项目。",
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const projectHref = project.demo_url || project.href;
  const content = (
    <>
      <div className="project-card-top">
        <span className="project-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="project-status">{project.status}</span>
        {projectHref && (
          <span className="project-arrow" aria-hidden="true">
            ↗
          </span>
        )}
      </div>
      <div className="project-card-art" aria-hidden="true">
        <span>{project.name.slice(0, 1)}</span>
      </div>
      <div className="project-card-body">
        <p className="project-card-kicker">{project.role}</p>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </>
  );

  if (!projectHref) {
    return (
      <article className="project-card project-card-static glass-card">
        {content}
      </article>
    );
  }

  return (
    <a
      href={projectHref}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card glass-card"
    >
      {content}
    </a>
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="content-page">
      <section className="page-hero glass-panel">
        <p className="post-eyebrow">SELECTED WORK</p>
        <h1>项目与作品</h1>
        <p className="page-lead">
          把想法做出来，也把过程记录下来。这里会持续更新我的产品、实验和开源项目。
        </p>
      </section>

      <section className="project-grid" aria-label="项目列表">
        {projects.map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} />
        ))}
      </section>
    </div>
  );
}
