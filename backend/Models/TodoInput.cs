namespace TodoApi.Models;

// What a client is allowed to send. Id is deliberately absent: the database assigns it.
public record TodoInput(string? Title, bool IsDone);
