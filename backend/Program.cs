using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// Create the database / apply pending migrations so a fresh clone just runs.
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

var todos = app.MapGroup("/todos");

// READ all
todos.MapGet("/", async (AppDbContext db) =>
    await db.Todos.ToListAsync());

// READ one
todos.MapGet("/{id:int}", async (int id, AppDbContext db) =>
    await db.Todos.FindAsync(id) is Todo todo
        ? Results.Ok(todo)
        : Results.NotFound());

// CREATE
todos.MapPost("/", async (TodoInput input, AppDbContext db) =>
{
    if (Validate(input) is { } problem) return problem;

    var todo = new Todo { Title = input.Title!.Trim(), IsDone = input.IsDone };
    db.Todos.Add(todo);
    await db.SaveChangesAsync();
    return Results.Created($"/todos/{todo.Id}", todo);
});

// UPDATE
todos.MapPut("/{id:int}", async (int id, TodoInput input, AppDbContext db) =>
{
    if (Validate(input) is { } problem) return problem;

    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    todo.Title = input.Title!.Trim();
    todo.IsDone = input.IsDone;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// DELETE
todos.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

// Returns a 400 response if the input is invalid, or null if it's fine.
static IResult? Validate(TodoInput input) =>
    string.IsNullOrWhiteSpace(input.Title)
        ? Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["title"] = ["Title is required."]
        })
        : null;
